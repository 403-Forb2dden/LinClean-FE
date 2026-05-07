import { Redirect } from 'expo-router';

export default function IndexScreen() {
  // TODO(auth): 로그인 연동 전 임시 진입점입니다.
  // 토큰 저장/조회 로직이 연결되면 토큰 유무에 따라 홈 또는 로그인 화면으로 분기해야 합니다.
  return <Redirect href="/login" />;
}
