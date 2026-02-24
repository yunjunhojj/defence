🛡️ Project: Web Defense Academy (WDA)
웹 보안의 기초를 게임처럼 재미있게 배울 수 있는 인터랙티브 학습 플랫폼입니다. Learn Git Branching과 같은 시각적 피드백 시스템을 통해 복잡한 보안 개념을 직관적으로 이해하도록 돕습니다.

🎮 Game Concept
역할: 사용자는 '화이트 해커'가 되어 취약점이 있는 웹 앱을 공격(Offensive)하거나 방어(Defensive)합니다.

방식: 브라우저 내장 에디터로 코드를 수정하고, 결과 애니메이션을 통해 성공 여부를 확인합니다.

핵심 가치: 실시간 코드 실행, 시각적 데이터 흐름 가시화, 단계별 학습.

Gemini의 응답
준호님이 구상하신 프로젝트의 핵심 내용을 antigravity 환경이나 README.md에 바로 붙여넣으실 수 있도록 깔끔하게 정리해 보았습니다. 🚀

🛡️ Project: Web Defense Academy (WDA)
웹 보안의 기초를 게임처럼 재미있게 배울 수 있는 인터랙티브 학습 플랫폼입니다. Learn Git Branching과 같은 시각적 피드백 시스템을 통해 복잡한 보안 개념을 직관적으로 이해하도록 돕습니다.

🎮 Game Concept
역할: 사용자는 '화이트 해커'가 되어 취약점이 있는 웹 앱을 공격(Offensive)하거나 방어(Defensive)합니다.

방식: 브라우저 내장 에디터로 코드를 수정하고, 결과 애니메이션을 통해 성공 여부를 확인합니다.

핵심 가치: 실시간 코드 실행, 시각적 데이터 흐름 가시화, 단계별 학습.

🧱 Curriculum (Stage Design)
단계	|주제	|상세 미션 내용	|기대 효과
------
Stage 1	|XSS	|스크립트를 삽입해 alert 창을 띄우거나 쿠키 탈취하기	|스크립트 인젝션의 원리 이해
Stage 2	|SQLi	|로그인 폼에 특정 쿼리를 입력해 인증 우회하기	|DB 보안 및 파라미터 바인딩 중요성 체득
Stage 3	|CSRF	|비밀번호를 강제로 변경하는 악성 링크/폼 생성하기	|세션 관리 및 토큰 검증의 필요성 인식
Stage 4	|CORS	|잘못된 도메인 설정으로 인한 데이터 유출 막기	|보안 헤더 및 정책 설정법 학습


🛠️ Tech Stack
Frontend & UI
React (Vite) & TypeScript: 안정적인 상태 관리 및 빠른 개발 환경.
Tailwind CSS: 생산성 높은 스타일링.
Framer Motion: 공격 성공/실패 시의 부드러운 애니메이션 피드백.
Zustand: 게임 진행 상황(스테이지, 잠금 해제 등) 전역 관리.
Code Editor & Runtime
Monaco Editor: VS Code와 유사한 코딩 경험 제공.
HTML5 Sandbox iframe: 사용자 코드를 안전하게 격리하여 실행.

🚀 Future Roadmap
MVP (Minimum Viable Product): XSS 스테이지 1개와 기본 에디터 환경 구축.
Expansion: 스테이지 확장 및 사용자 랭킹 시스템 도입.
Community: 사용자가 직접 '보안 맵(Stage)'을 설계하고 공유하는 오픈소스화.