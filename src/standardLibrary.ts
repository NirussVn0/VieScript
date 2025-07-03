export const standardLibraryCode = `
function độ_dài(obj) {
  if (typeof obj === 'string' || Array.isArray(obj)) {
    return obj.length;
  }
  console.error("Lỗi: độ_dài() chỉ áp dụng cho chuỗi hoặc mảng.");
  return null;
}

function kiểu_của(value) {
  if (value === null) return "rỗng";
  return typeof value;
}

function thành_chuỗi(value) {
    return String(value);
}
`;