# 바이브코딩 전자책 사전예약 → 구글시트 연결 (최초 1회)

## 생성·확인 완료

- [전용 구글시트](https://docs.google.com/spreadsheets/d/1NkWsnCd1zSkKZQkh8xlic9Hv5X_y7cYe4daCKBVnytg/edit)
- 저장 탭: `사전예약접수`
- 저장 열: 접수일시 | 접수번호 | 카페닉네임 | 연락처 | 이메일 | 문의사항 | 결제수단 | 접수상태 | 유입페이지
- 결제수단: 카드 / 현금. **결제 여부 필드는 없습니다.**
- 홈페이지 폼·Apps Script 저장 코드는 준비됨. **Apps Script 웹앱 주소(/exec) 연결 전에는 홈페이지 제출 버튼 비활성화**.

## 한 번만 진행할 작업 — Apps Script 웹앱 배포

1. 전용 구글시트를 연 계정으로 [Apps Script](https://script.google.com/home/projects/create)에 접속합니다.
2. 새 프로젝트의 `Code.gs`를 열고 저장소 `google-apps-script/Code.gs`의 전체 내용을 붙여 넣고 저장합니다.
3. **배포 → 새 배포 → 유형: 웹 앱**을 선택합니다.
4. 실행 사용자: **나**. 액세스 권한이 있는 사용자: **모든 사용자**.
5. Google 권한 승인 후 생성된 `https://script.google.com/macros/s/.../exec` 주소를 복사합니다.
6. GitHub 파일 `assets/preorder-config.js`의 `window.VIBE_PREORDER_WEBAPP_URL = ''`에 해당 주소를 설정합니다.
7. GitHub Pages 자동 배포 후 사전예약 폼을 실제 제출합니다.
8. 새 창에 **사전예약이 접수됐습니다** 및 접수번호가 표시되는지, 전용 시트에 동일 접수번호로 새 행이 생겼는지 확인합니다.

## 주의사항

- 구글시트 자체를 공개하지 마세요. 개인정보가 수집됩니다.
- Apps Script 웹앱은 배포하는 본인 Google 계정에 이 시트의 편집 권한이 있어야 합니다.
- 카드·현금 선택은 방문자의 선택일 뿐 실제 결제 승인/입금을 검증하지 않습니다.
- 해당 웹앱 URL을 등록하기 전에는 제출을 열지 말고, 확인되지 않은 접수 완료 메시지를 보여주지 마세요.
