import { Metadata } from 'next';
import ArticleForm from '@/components/admin/articles/article-form';

export const metadata: Metadata = {
  title: 'New Article - Admin',
};

export default function NewArticlePage() {
  return (
    <div>
      <ArticleForm />
    </div>
  );
}
