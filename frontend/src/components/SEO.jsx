import React from 'react';
import { Helmet } from 'react-helmet-async';

const SEO = ({ title, description, type = 'website', image, url }) => {
  const siteName = 'IndhuVadhana';
  const defaultDescription = 'IndhuVadhana - Your ultimate destination for modern, traditional, and elegant clothing.';
  const defaultImage = '/favicon.ico'; // In production, use an actual OG image url

  return (
    <Helmet>
      {/* Standard metadata tags */}
      <title>{title ? `${title} | ${siteName}` : siteName}</title>
      <meta name="description" content={description || defaultDescription} />

      {/* Open Graph tags */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={title ? `${title} | ${siteName}` : siteName} />
      <meta property="og:description" content={description || defaultDescription} />
      {image && <meta property="og:image" content={image || defaultImage} />}
      {url && <meta property="og:url" content={url} />}

      {/* Twitter tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title ? `${title} | ${siteName}` : siteName} />
      <meta name="twitter:description" content={description || defaultDescription} />
      {image && <meta name="twitter:image" content={image || defaultImage} />}
    </Helmet>
  );
};

export default SEO;
