import { TermsDocumentScreen } from '@/components/terms/terms-document-screen';

export default function PrivacyScreen() {
  return (
    <TermsDocumentScreen
      type="privacy_policy"
      fallbackTitle="개인정보 처리방침"
    />
  );
}
