export interface InfoItem {
  name: string
  link: string
  description?: string
}

export interface InfoCategory {
  title: string
  items: InfoItem[]
}

export interface InfoData {
  categories: InfoCategory[]
}
