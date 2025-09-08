package com.assignment.ijse.back_end.entity.enums;

public enum ClaimStatus {
    PENDING, FINDER_APPROVED, ADMIN_APPROVED, FINDER_REJECTED, ADMIN_REJECTED, OWNER_APPROVED, OWNER_REJECTED,COMPLETED
}

//
// * Enum representing the possible statuses of a Claim.
// *
// * Each status indicates the current stage of verification or action
// * on a claim related to lost or found items. The status primarily
// * reflects **who approved or rejected the claim**, or if it is
// * pending/completed.
// *
// * Statuses:
// *
// * PENDING
// *   - Claim has been created but not yet approved or rejected.
// *
// * FINDER_APPROVED
// *   - The finder of a lost item has approved the claim.
// *   - Typically occurs when the claimant is the owner claiming
// *     their lost item.
// *
// * ADMIN_APPROVED
// *   - An administrator has approved the claim after verification.
// *
// * FINDER_REJECTED
// *   - The finder of a lost item has rejected the claim.
// *
// * ADMIN_REJECTED
// *   - An administrator has rejected the claim after verification.
// *
// * OWNER_APPROVED
// *   - The owner of a found item has approved the claim.
// *   - Typically occurs when the claimant is the finder claiming
// *     a found item.
// *
// * OWNER_REJECTED
// *   - The owner of a found item has rejected the claim.
// *
// * COMPLETED
// *   - The claim process is fully completed.
// *   - All required approvals are done and the item is considered officially claimed.
//
