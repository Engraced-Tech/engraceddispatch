package com.esdispatch.viewmodel

import androidx.lifecycle.viewModelScope
import com.esdispatch.data.CardInfo
import com.esdispatch.data.FirebaseManager
import com.esdispatch.data.Transaction
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

open class WalletViewModel : AuthViewModel() {

    protected val _walletBalance = MutableStateFlow(0.0)
    val walletBalance: StateFlow<Double> = _walletBalance.asStateFlow()

    protected val _paymentCards = MutableStateFlow<List<CardInfo>>(emptyList())
    val paymentCards: StateFlow<List<CardInfo>> = _paymentCards.asStateFlow()

    protected val _transactions = MutableStateFlow<List<Transaction>>(emptyList())
    val transactions: StateFlow<List<Transaction>> = _transactions.asStateFlow()

    fun topUpWallet(
        amount: Double,
        reference: String? = null,
        onComplete: ((Boolean, String) -> Unit)? = null
    ) {
        val uid = _firebaseUserId.value
        if (uid == null) {
            onComplete?.invoke(false, "User must be signed in to perform wallet transactions.")
            return
        }

        if (amount == 0.0) {
            onComplete?.invoke(false, "Invalid transaction amount.")
            return
        }

        val isTopUp = amount > 0
        val title = if (isTopUp) "Wallet Top Up (Paystack)" else "Cash Withdrawal"
        val displayAmt = if (amount < 0) -amount else amount
        val txRef = if (!reference.isNullOrBlank()) reference else "TX-PAY-${System.currentTimeMillis()}"

        if (isTopUp && !reference.isNullOrBlank()) {
            val functions = com.google.firebase.functions.FirebaseFunctions.getInstance()
            val callData = hashMapOf(
                "amount" to amount,
                "reference" to reference
            )
            functions.getHttpsCallable("verifyPaymentAndTopUp")
                .call(callData)
                .addOnSuccessListener { result ->
                    val resData = result.data as? Map<*, *>
                    val newBal = (resData?.get("newBalance") as? Number)?.toDouble() ?: (_walletBalance.value + amount)
                    _walletBalance.value = newBal
                    savePref("wallet_balance", newBal)

                    val localTx = Transaction(
                        id = txRef,
                        title = title,
                        date = "Today",
                        amount = displayAmt,
                        isTopUp = true,
                        type = "CREDIT",
                        status = "SUCCESS",
                        reference = txRef,
                        userId = uid
                    )
                    _transactions.value = listOf(localTx) + _transactions.value

                    val notifTitle = "Wallet Credited"
                    val notifMessage = "Your ESDispatch wallet has been topped up with ₦${String.format("%,.2f", displayAmt)}."
                    addNotification(notifTitle, notifMessage)
                    onComplete?.invoke(true, "Wallet successfully credited.")
                }
                .addOnFailureListener { err ->
                    android.util.Log.e("WalletTopUp", "Server payment verification failed", err)
                    onComplete?.invoke(false, err.message ?: "Payment verification failed. If charged, contact support.")
                }
            return
        }

        // C11 remediation: client-side wallet credits were removed entirely.
        // Every balance mutation is verified server-side (Paystack reference
        // required for top-ups; withdrawals flow through the review callable).
        if (isTopUp) {
            com.esdispatch.util.SoundManager.playErrorBuzz()
            onComplete?.invoke(false, "Top-up requires a completed payment reference. Please retry payment.")
        } else {
            com.esdispatch.util.SoundManager.playErrorBuzz()
            onComplete?.invoke(false, "Please use the withdrawal request flow.")
        }
        return
    }

    fun requestWithdrawal(
        amount: Double,
        bankName: String,
        accountNumber: String,
        accountName: String,
        userRole: String = "customer",
        onComplete: (Boolean, String?) -> Unit = { _, _ -> }
    ) {
        val uid = _firebaseUserId.value
        if (uid == null) {
            onComplete(false, "User must be signed in to perform withdrawal.")
            return
        }
        if (amount <= 0.0) {
            onComplete(false, "Invalid withdrawal amount.")
            return
        }
        if (amount > _walletBalance.value) {
            onComplete(false, "Insufficient wallet balance.")
            return
        }
        // Server-authoritative withdrawal (C11 remediation): the wallet debit
        // and the review-queue request are produced by the
        // `requestWalletWithdrawal` Cloud Function.
        val functions = com.google.firebase.functions.FirebaseFunctions.getInstance()
        val callData = hashMapOf(
            "amount" to amount,
            "bankName" to bankName,
            "accountNumber" to accountNumber,
            "accountName" to accountName
        )
        functions.getHttpsCallable("requestWalletWithdrawal").call(callData)
            .addOnSuccessListener { result ->
                val data = result.data as? Map<*, *>
                val newBal = ((data?.get("newBalance") as? Number)?.toDouble())
                    ?: (_walletBalance.value - amount).coerceAtLeast(0.0)
                _walletBalance.value = newBal
                savePref("wallet_balance", newBal)
                val notifTitle = "Withdrawal Submitted"
                val notifMsg = "Your withdrawal request of ₦${String.format("%,.2f", amount)} has been submitted for admin processing."
                addNotification(notifTitle, notifMsg)
                onComplete(true, null)
            }
            .addOnFailureListener { err ->
                android.util.Log.w("Withdrawal", "requestWalletWithdrawal failed: ${err.message}")
                onComplete(false, err.message ?: "Withdrawal request failed. Please try again.")
            }
    }

    fun adminFundUserWallet(userId: String, userName: String, amount: Double, onResult: (Boolean, String) -> Unit) {
        if (amount <= 0) { onResult(false, "Amount must be positive"); return }
        viewModelScope.launch {
            com.esdispatch.data.FirebaseManager.updateUserWalletBalance(userId, amount) { success, newBalance ->
                if (success) {
                    val txRef = "ESD-ADMIN-${System.currentTimeMillis()}"
                    com.esdispatch.data.FirebaseManager.recordLedgerTransaction(
                        userId = userId,
                        amount = amount,
                        title = "Admin Credit",
                        isTopUp = true,
                        reference = txRef,
                        status = "SUCCESS"
                    ) { _ -> }
                    logAdminActivity("Wallet Credit", "Credited ₦$amount to $userName ($userId)")
                    onResult(true, "Wallet credited successfully. New balance: ₦${String.format("%,.2f", newBalance)}")
                } else {
                    onResult(false, "Failed to update user wallet balance")
                }
            }
        }
    }


    fun addPaymentCard(card: CardInfo, onResult: (Boolean) -> Unit) {
        val current = _paymentCards.value.toMutableList()
        if (!current.any { it.last4 == card.last4 }) {
            current.add(card)
            _paymentCards.value = current
        }
        val uid = _firebaseUserId.value
        val db = com.esdispatch.data.FirebaseManager.firestore
        if (uid != null && db != null) {
            val cardMap = hashMapOf(
                "type" to card.type,
                "last4" to card.last4,
                "expiry" to card.expiry,
                "createdAt" to System.currentTimeMillis()
            )
            db.collection("users").document(uid).collection("payment_cards")
                .document("CARD-${card.last4}")
                .set(cardMap)
                .addOnSuccessListener { onResult(true) }
                .addOnFailureListener { onResult(true) }
        } else {
            onResult(true)
        }
    }

    fun removePaymentCard(card: CardInfo, onResult: (Boolean) -> Unit) {
        val current = _paymentCards.value.toMutableList()
        current.removeAll { it.last4 == card.last4 }
        _paymentCards.value = current
        val uid = _firebaseUserId.value
        val db = com.esdispatch.data.FirebaseManager.firestore
        if (uid != null && db != null) {
            db.collection("users").document(uid).collection("payment_cards")
                .document("CARD-${card.last4}")
                .delete()
                .addOnSuccessListener { onResult(true) }
                .addOnFailureListener { onResult(true) }
        } else {
            onResult(true)
        }
    }

    fun fetchUserPaymentCards() {
        val uid = _firebaseUserId.value ?: return
        val db = com.esdispatch.data.FirebaseManager.firestore ?: return
        db.collection("users").document(uid).collection("payment_cards")
            .get()
            .addOnSuccessListener { snap ->
                val cards = snap.documents.mapNotNull { doc ->
                    val type = doc.getString("type") ?: "Card"
                    val last4 = doc.getString("last4") ?: "0000"
                    val expiry = doc.getString("expiry") ?: "12/28"
                    CardInfo(type, last4, expiry)
                }
                _paymentCards.value = cards
            }
            .addOnFailureListener { e ->
                android.util.Log.e("WalletViewModel", "Failed to fetch cards: ${e.message}")
            }
    }
}
