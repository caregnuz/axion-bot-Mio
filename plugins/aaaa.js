module.exports = {
  name: "aaaa",
  command: ["prova1"],

  async execute(sock, msg, text, args) {
    await sock.sendMessage(msg.key.remoteJid, {
      text: "plugin aaa"
    });
  }
};