const bcrypt = require("bcryptjs");
const readline = require("readline");

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

rl.question("Choose admin password: ", (password) => {
    console.log("\nBcrypt hash:\n" + bcrypt.hashSync(password, 10));
    rl.close();
});