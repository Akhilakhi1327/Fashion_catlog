/**
 * Optimizes Cloudinary image URLs by injecting transformations (f_auto, q_auto, w_width)
 * 
 * @param {string} url - Original image URL
 * @param {number} width - Optional width to scale down
 * @returns {string} Optimized URL
 */
export const getOptimizedImageUrl = (url, width) => {
  if (!url) return '';
  
  // Only apply to Cloudinary URLs
  if (!url.includes('res.cloudinary.com')) return url;

  // If already contains typical transformations (like f_auto), don't inject again
  if (url.includes('/upload/f_') || url.includes('/upload/q_')) return url;

  const transformations = ['f_auto', 'q_auto'];
  if (width) {
    transformations.push(`w_${width}`);
    transformations.push('c_scale');
  }

  const transformationStr = `${transformations.join(',')}/`;
  
  return url.replace('/upload/', `/upload/${transformationStr}`);
};
