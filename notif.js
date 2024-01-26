var push = require("web-push");

let vapidKeys = {
  publicKey:
    "BAeRtWPMnIVjZBidFdKLRP4P7FB6ekbe3bThEofCHASAYtloHpfeWI0Zd0SBePtkzy5UT8czPQUHviFbEm20llY",
  privateKey: "hL-Pd5Gl2FwTJ7Fy9vbJtPRMnOsXSMvZfhfQfHrNKgE",
};

push.setVapidDetails(
  "mailto:test@code.uk.co",
  vapidKeys.publicKey,
  vapidKeys.privateKey
);

let sub = {
  endpoint:
    "https://fcm.googleapis.com/fcm/send/dZ-gde75-xY:APA91bFPK1Ajb9TvpaLy8vmImh9LGrl_3jIwUVUkdIbtJW1YL3vKpB4qu5TCUTYaq1Vcnc7jGb92vymOMiqv8uWuh_OpHL43DnkCHeQAv_u5rv9fmrQVI7cMq4KjPl2kEqhvE7_nY4_q",
  expirationTime: null,
  keys: {
    p256dh:
      "BDOTbeP3PowuEuanxY0xNhgoLJKtw5RVDsJM51lhxn03MBy65rHxzfrkXY18A9S7GCG7a1Ted4v7stFTCK5T97k",
    auth: "U-CsD86dBy1gNpXJMVIcSA",
  },
};

push.sendNotification(sub, "test message");

// console.log(vapidKeys);
