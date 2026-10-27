/**
 * 바이브코딩 사전예약 — 구글시트에 바인딩되는 Apps Script
 * 1. https://script.google.com/home/projects/create 에서 Apps Script 프로젝트 생성
 * 2. 이 파일 전체를 Code.gs에 붙여 넣고 저장
 * 3. 배포 → 새 배포 → 웹 앱 → 실행 사용자 "나", 액세스 "모든 사용자"
 * 4. 발급된 /exec 주소를 assets/preorder-config.js에 입력
 * 5. 아래 SPREADSHEET_ID의 전용 구글시트 사전예약접수 탭에 저장됨
 * 카드/현금은 신청자 선택이며 실제 결제 승인을 검증하지 않습니다.
 */
const SPREADSHEET_ID = '1NkWsnCd1zSkKZQkh8xlic9Hv5X_y7cYe4daCKBVnytg';
const SHEET_NAME = '사전예약접수';
const HEADERS = [
  '접수일시', '접수번호', '카페닉네임', '연락처', '이메일',
  '문의사항', '결제수단', '접수상태', '유입페이지'
];
function doGet() {
  return result_('사전예약 안내', '공식 홈페이지에서 사전예약을 신청해 주세요.', false);
}
function doPost(e) {
  const p = (e && e.parameter) || {};
  const field = key => String(p[key] || '').trim();
  const nickname = field('nickname').slice(0, 60);
  const phone = field('phone').replace(/[\s-]/g, '').slice(0, 20);
  const email = field('email').slice(0, 140);
  const inquiry = field('inquiry').slice(0, 1500);
  const paymentMethod = field('payment_method');
  const consent = field('privacy_agree');
  const origin = field('origin').slice(0, 250);
  if (field('website')) return result_('접수 실패', '다시 신청해 주세요.', false);
  if (!nickname || !/^0\d{8,10}$/.test(phone) ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
      !['카드','현금'].includes(paymentMethod) || consent !== 'on') {
    return result_('입력 내용을 확인해 주세요.', '필수 항목을 확인하고 다시 신청해 주세요.', false);
  }
  const lock = LockService.getScriptLock();
  if (!lock.tryLock(12000)) return result_('접수 실패', '잠시 후 다시 신청해 주세요.', false);
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    if (!ss) throw new Error('사전예약 전용 구글시트에 접근할 수 없습니다.');
    let sheet = ss.getSheetByName(SHEET_NAME);
    if (!sheet) sheet = ss.insertSheet(SHEET_NAME);
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(HEADERS);
      sheet.setFrozenRows(1);
      sheet.getRange(1,1,1,HEADERS.length).setFontWeight('bold').setBackground('#F1F3F5');
    }
    const safe = value => /^[=+@\-\t\r]/.test(value) ? "'" + value : value;
    const receipt = Utilities.getUuid().split('-')[0].toUpperCase();
    const timestamp = Utilities.formatDate(new Date(), 'Asia/Seoul', 'yyyy-MM-dd HH:mm:ss');
    sheet.appendRow([timestamp, receipt, safe(nickname), "'" + phone, safe(email), safe(inquiry),
      paymentMethod, '신규', safe(origin)]);
    SpreadsheetApp.flush();
    return result_('사전예약이 접수됐습니다.', '접수번호: ' + receipt, true);
  } catch (error) {
    console.error('PREORDER_SAVE_FAILURE', error);
    return result_('접수 실패', '저장 중 오류가 발생했습니다. 관리자에게 문의해 주세요.', false);
  } finally {
    lock.releaseLock();
  }
}
function result_(title, message, success) {
  const escapeHTML = value => String(value).replace(/[&<>"']/g, char =>
    ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  const color = success ? '#9B2C72' : '#A12543';
  const html = `<!doctype html><html lang="ko"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${escapeHTML(title)}</title>
<style>body{background:#F8F6F8;color:#241D26;font-family:Arial,sans-serif;min-height:100vh;margin:0;padding:24px;display:grid;place-items:center;box-sizing:border-box}
main{width:100%;max-width:480px;background:#fff;padding:42px 24px;border-radius:18px;box-shadow:0 14px 40px #241D2618;text-align:center}
h1{font-size:25px;color:${color};letter-spacing:-.05em}p{font-size:16px;line-height:1.7}
a{display:inline-block;background:#241D26;color:white;text-decoration:none;padding:13px 23px;border-radius:8px;margin-top:15px}</style></head>
<body><main><h1>${escapeHTML(title)}</h1><p>${escapeHTML(message)}</p>
<a href="https://pc9839a-lgtm.github.io/vibecoding-landing/">홈페이지로 돌아가기</a></main></body></html>`;
  return HtmlService.createHtmlOutput(html).setTitle(title);
}
