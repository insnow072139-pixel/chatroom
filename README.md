# 온라인 배포용 채팅방

## 로컬 실행
Node.js 설치 후:
npm install
npm run dev

## 배포
이 프로젝트는 Express + WebSocket 서버와 Vite 프론트엔드를 하나의 Node 서비스로 실행하도록 구성되어 있습니다.
배포 서비스에서 Build Command는 `npm install && npm run build`, Start Command는 `npm start`로 설정하면 됩니다.

친구는 배포된 HTTPS 주소만 열면 됩니다. Node.js/npm 설치가 필요하지 않습니다.

화면공유는 브라우저 권한이 필요하며 HTTPS 환경에서 사용하는 것을 권장합니다.
