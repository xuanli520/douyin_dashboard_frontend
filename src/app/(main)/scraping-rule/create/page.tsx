'use client';

import React from 'react';
import { CreateForm } from '@/features/scraping-rule/components/ScrapingRuleForm/CreateForm';

export default function CreateScrapingRulePage() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <CreateForm />
    </div>
  );
}
