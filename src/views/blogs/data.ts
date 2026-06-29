export interface ArticleCard {
  id: number
  title: string
  desc: string
  tag: string
  tagType: '' | 'success' | 'warning' | 'danger' | 'info'
  category: string
  date: string
  views: string
  icon: string
  coverBg: string
  link: string
}

export interface ProjectCard {
  name: string
  desc: string
  icon: string
  color: string
  bgColor: string
  url: string
}

export function openLink(url: string) {
  window.open(url, '_blank')
}
