'use client';

import React from 'react';
import { PostEditor } from '@/components/admin/post-editor';

export default function NewPostPage() {
  return <PostEditor isEdit={false} />;
}
