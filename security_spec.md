# Security Spec for Moharram Video

## 1. Data Invariants
1. A video cannot exist without a valid userId that belongs to the authenticated user.
2. Likes, Comments must be subcollections of the video.
3. Users can only update their own profile data.
4. Users cannot modify other users' roles or admin status.
5. Messages must belong to a valid chat, and the user sending the message must be a participant in that chat.
6. A Chat cannot be created unless the user is one of the participants.
7. Followers/Following must be subcollections to prevent unbounded array growth.
8. Notifications can only be created by the system/functions, or by other users strictly when performing interactions (Like/Comment).
9. Admin role can only be granted via Firebase Console directly, bypassing the client app.

## 2. The "Dirty Dozen" Payloads
1. Create Video with wrong userId (Identity Spoofing).
2. Create Follower for someone else.
3. Add a comment representing another user.
4. Create a chat where user is not in participants list.
5. Send a message to a chat the user is not part of.
6. Delete another user's video.
7. Add 1.5MB junk to bio (Resource Poisoning).
8. Send a message with `createdAt` not equal to `request.time` (Temporal Integrity).
9. Add a like with a non-string Id or non-standard format.
10. Update User Profile to change `isAdmin`.
11. Update Video `likesCount` arbitrarily (State Shortcutting).
12. Read another user's private chat.

## 3. The Test Runner
Tests will be in `firestore.rules.test.ts` to assert PERMISSION_DENIED on these payloads.
