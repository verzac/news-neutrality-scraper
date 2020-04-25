import { News } from "./news";
import sentimentAnalyzerService from "./sentiment-analyzer.service";
import newsApiService from "./news/newsapi.service";
import topicScoreRepository from "../repositories/topic-score.repository";

export type GetTopicResult = {
  score: number | null;
  newsArticlesAnalyzed: number;
  sampleAnalyzedArticles: Array<News>;
};

async function getTopicScore(topic: string, shouldStoreTopic = true): Promise<GetTopicResult> {
  const newsArr = await newsApiService.getNews({
    q: topic,
    page: 1,
    pageSize: 50
  });
  const newsScores = await Promise.all(newsArr.map(news => sentimentAnalyzerService.analyzeText(news.content)));
  const firstScore = newsScores.pop();
  const sampleAnalyzedArticles = newsArr;
  if (firstScore === undefined) {
    return {
      score: null,
      newsArticlesAnalyzed: 0,
      sampleAnalyzedArticles: sampleAnalyzedArticles,
    };
  }
  const numberOfNewsArticlesAnalyzed = newsScores.length + 1;
  const avgScore = newsScores.reduce((accumulator, score) => accumulator + score, firstScore) / numberOfNewsArticlesAnalyzed;
  if (shouldStoreTopic) {
    await topicScoreRepository.put({
      score: avgScore,
      topic: topic,
    });
  }
  return {
    score: avgScore,
    newsArticlesAnalyzed: numberOfNewsArticlesAnalyzed,
    sampleAnalyzedArticles: sampleAnalyzedArticles,
  };
}

export default {
  getTopicScore,
};