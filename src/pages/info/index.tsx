import CodeBlock from '@theme/CodeBlock'
import Layout from '@theme/Layout'
import React, { memo, useRef, useState } from 'react'
import Link from '@docusaurus/Link'
import { motion } from 'framer-motion'
import { tg群组Data } from '@site/data/info/tg群组'
import { 中文博客Data } from '@site/data/info/中文博客'
import { 投资Data } from '@site/data/info/投资'
import type { InfoData, InfoCategory, InfoItem } from '@site/data/info/types'
import styles from './styles.module.css'

const TITLE = '信息'
const DESCRIPTION = '信息聚合页面，包含TG群组、中文博客、投资等各类资源'

interface InfoModule {
  name: string
  data: InfoData
  key: string
}

const infoModules: InfoModule[] = [
  { name: 'TG群组', data: tg群组Data, key: 'tg' },
  { name: '中文博客', data: 中文博客Data, key: 'blog' },
  { name: '投资', data: 投资Data, key: 'invest' },
]

function InfoHeader() {
  return (
    <section className="margin-top--lg margin-bottom--lg text-center">
      {/* <h1>{TITLE}</h1>
      <p>{DESCRIPTION}</p> */}
    </section>
  )
}

const InfoCard = memo(({ item }: { item: InfoItem }) => (
  <li className="relative flex min-h-24 cursor-pointer flex-row items-center overflow-hidden rounded-card bg-card px-4 py-1 transition-all duration-300 hover:translate-y-[-5px] hover:scale-[1.01] hover:bg-[rgba(229,231,235,0.3)] hover:shadow-[0_3px_10px_0_rgba(164,190,217,0.3)]">
    <div className="flex-1 pl-4">
      <div className="mb-1 flex items-center">
        <h4 className="mb-0 flex-1">

          <Link
            to={item.link}
            target="_blank"
            rel="noopener noreferrer"
            className="from-ifm-color-primary to-ifm-color-primary bg-gradient-to-b bg-[length:0%_1px] bg-[0%_100%] bg-no-repeat no-underline transition-[background-size] duration-200 ease-out hover:bg-[length:100%_1px] focus:bg-[length:100%_1px]"
          >
            {item.name}
          </Link>
        </h4>
      </div>
      {item.description && (
        <p className="m-0 line-clamp-2 w-full overflow-hidden text-sm leading-[1.66]">
          {item.description}
        </p>
      )}
    </div>
  </li>
))

function CategorySection({ category }: { category: InfoCategory }) {
  return (
    <div className={styles.categorySection}>
      <h2 className={styles.categoryTitle}>{category.title}</h2>
      <ul className="grid grid-cols-1 gap-6 p-0 sm:grid-cols-2 lg:grid-cols-3">
        {category.items.map((item, index) => (
          <InfoCard key={`${item.name}-${index}`} item={item} />
        ))}
      </ul>
    </div>
  )
}

function ModuleSection({
  moduleName,
  data,
}: {
  moduleName: string
  data: InfoData
}) {
  return (
    <section className="my-8">
      <div className="mx-auto max-w-6xl px-4 py-2">
        <h1 className={styles.moduleTitle}>{moduleName}</h1>
        {data.categories.map((category, index) => (
          <CategorySection key={`${category.title}-${index}`} category={category} />
        ))}
      </div>
    </section>
  )
}

export default function InfoPage(): React.ReactElement {
  const ref = useRef<HTMLDivElement>(null)
  const [selectedModule, setSelectedModule] = useState<string | null>(null)

  const filteredModules = selectedModule
    ? infoModules.filter(m => m.key === selectedModule)
    : infoModules

  return (
    <Layout title={TITLE} description={DESCRIPTION} wrapperClassName="bg-background">
      <motion.main ref={ref} className="my-4">
        <InfoHeader />

        {/* 模块筛选 */}
        <div className={styles.filterBar}>
          <button
            className={`button button--sm ${selectedModule === null ? 'button--primary' : 'button--secondary'}`}
            onClick={() => setSelectedModule(null)}
          >
            全部
          </button>
          {infoModules.map(module => (
            <button
              key={module.key}
              className={`button button--sm ${selectedModule === module.key ? 'button--primary' : 'button--secondary'}`}
              onClick={() =>
                setSelectedModule(selectedModule === module.key ? null : module.key)}
            >
              {module.name}
            </button>
          ))}
        </div>

        {/* 模块内容 */}
        {filteredModules.map(module => (
          <ModuleSection key={module.key} moduleName={module.name} data={module.data} />
        ))}
      </motion.main>
    </Layout>
  )
}
