const express = require("express");
const router = express.Router();
const crypto = require("crypto");
const Invitation = require("../model/invitationModel");

const generateInvitationCode = () => {
  return crypto.randomBytes(16).toString("hex");
};

router.post("/create/invite", async (request, response) => {
  const { email } = request.body;

  try {
    const code = generateInvitationCode();
    const expirationDate = new Date();
    expirationDate.setDate(expirationDate.getDate() + 7); // 7 days validity
    const invitation = new Invitation({
      code,
      email,
      expirationDate,
    });
    await invitation.save();
    response.json(code);
  } catch (error) {
    response.status(500).json({ error: error.message });
  }
});

module.exports = router;
