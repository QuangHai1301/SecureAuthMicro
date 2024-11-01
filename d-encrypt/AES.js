const crypto = require('crypto');

// Tạo key và iv
const key = crypto.randomBytes(32).toString('hex'); // Khóa bí mật có độ dài 256 bit (32 bytes)
const iv = crypto.randomBytes(16).toString('hex'); // Vector khởi tạo có độ dài 128 bit (16 bytes)
const a = 'abc123';
const b = 'sm0T49cIWZY7P7+3Y2CTDw==';
const c = 'e3d197242dceba2243f352037726286bac707534f6fb323016030e4128c99e3d';
const d = 'cc12b2d4367d6631fc640ae2b8a38d8b';
// Hàm mã hóa chuỗi
// function encrypt(text, key, iv) {
//   const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(key, 'hex'), Buffer.from(iv, 'hex'));
//   let encryptedData = cipher.update(text, 'utf8', 'base64');
//   encryptedData += cipher.final('base64');
//   return encryptedData;
// }

// Hàm giải mã chuỗi
function decrypt(ciphertext, key, iv) {
  const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(key, 'hex'), Buffer.from(iv, 'hex'));
  let decryptedData = decipher.update(ciphertext, 'base64', 'utf8');
  decryptedData += decipher.final('utf8');
  return decryptedData;
}

// Mã hóa dữ liệu
// const encryptedData = encrypt(a, key, iv);
// console.log("Dữ liệu đã mã hóa:", encryptedData);

// Giải mã dữ liệu
const decryptedData = decrypt(b, c, d);
console.log("Dữ liệu đã giải mã:", decryptedData);

// Kiểm tra
console.log("Kiểm tra: Dữ liệu ban đầu và dữ liệu sau khi giải mã có khớp không?", a === decryptedData);