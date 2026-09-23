'use client'

import { useI18n } from '../lib/i18n'

export default function I18nText({ k, className }: { k: string; className?: string }) {
  const { t } = useI18n()
  return <span className={className}>{t(k)}</span>
}
