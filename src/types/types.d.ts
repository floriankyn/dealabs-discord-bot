interface Option {
  label: string;
  value: string;
  description: string;
  emoji: string;
}

type AccumulatorType = Option[];

type dealabsRssFeed = {
  title: string;
  link: string;
  pubDate: string;
  creator: string;
  content: string;
  categories: string[];
  contentSnippet: string;
  guid: string;
  isoDate: string;
};
