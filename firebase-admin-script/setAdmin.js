// setAdmin.js
const admin = require("firebase-admin");
const serviceAccount = require("./serviceAccountKey.json"); 

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const email = "kaiqigeorge@gmail.com"; // 管理员的邮箱

admin
  .auth()
  .getUserByEmail(email)
  .then((user) => {
    return admin.auth().setCustomUserClaims(user.uid, { admin: true });
  })
  .then(() => {
    console.log(`✅ ${email} 已成功设置为管理员！`);
  })
  .catch((error) => {
    console.error("❌ 设置管理员权限失败：", error);
  });
