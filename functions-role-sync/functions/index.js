const { onDocumentWritten } = require("firebase-functions/v2/firestore");
const { initializeApp } = require("firebase-admin/app");
const { getAuth } = require("firebase-admin/auth");

initializeApp();

exports.syncUserRoleToCustomClaims = onDocumentWritten("members/{uid}", async (event) => {
  const uid = event.params.uid;
  const after = event.data?.after?.data();

  if (!after) return; // 删除文档时跳过

  const role = after.role || "member";

  try {
    await getAuth().setCustomUserClaims(uid, {
      admin: role === "admin",
    });
    console.log(`✅ Custom claims updated for ${uid}: role = ${role}`);
  } catch (error) {
    console.error(`❌ Failed to set custom claims for ${uid}:`, error);
  }
});

