import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getArticleById } from '@/app/actions/article';
import ArticleForm from '@/components/admin/articles/article-form';

export const metadata: Metadata = {
  title: 'Edit Article - Admin',
};

export default async function EditArticlePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = await params;
  const { article, error } = await getArticleById(resolvedParams.id);

  if (error || !article) {
    notFound();
  }

  return (
    <div>
      <ArticleForm
        initialData={{
          id: article.id,
          title: article.title,
          slug: article.slug,
          excerpt: article.excerpt || '',
          contentMd: article.contentMd,
          coverImage: article.coverImage || '',
          isPublished: article.isPublished,
          publishedAt: article.publishedAt,
        }}
      />
    </div>
  );
}
