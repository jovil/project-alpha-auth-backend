const Invitation = require("../model/invitationModel");

const validateInvitation = async (request, response, next) => {
  const { code } = request.body;
  const invitation = await Invitation.findOne({ code });

  if (!invitation) {
    return response.status(400).send({ message: "Invalid invitation code" });
  }

  if (invitation.status === "used") {
    return response
      .status(400)
      .send({ message: "Invitation code already used" });
  }

  if (new Date() > invitation.expirationDate) {
    return response.status(400).send({ message: "Invitation code expired" });
  }

  request.invitation = invitation; // Attach invitation to request object
  next();
};

module.exports = validateInvitation;
