import { uiClass } from '@/components/v5/classes';
import * as uiText from '@/content/fa';
import Link from '@/components/ui/app-link';
export default function NotFound() {
  return (
    <div className={uiClass('bootstrap state')}>
      <h1>{uiText.text_34878975f201}</h1>
      <Link href="/personal">{uiText.text_cdbeb6525b01}</Link>
    </div>
  );
}
