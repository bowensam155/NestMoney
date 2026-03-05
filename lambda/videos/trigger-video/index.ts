import type { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import type { TriggerEvent } from '../../../types/database';

interface TriggerVideoBody {
  triggerEvent: TriggerEvent;
  language: string;
  userId: string;
}

// Pipeline: check cache → HeyGen API → S3 upload → CloudFront → push notification
export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    const body = JSON.parse(event.body ?? '{}') as TriggerVideoBody;

    // TODO: Check education_videos for cached (trigger_event, language_code)
    // SELECT * FROM education_videos WHERE trigger_event = $1 AND language_code = $2
    // If cached: return existing cloudfront_url immediately

    // TODO: If not cached:
    //   1. Get HeyGen API key from Secrets Manager
    //   2. Call HeyGen API to generate video
    //   3. On HeyGen webhook completion:
    //      - Download video
    //      - Upload to S3 (key: `videos/{triggerEvent}/{language}/video.mp4`)
    //      - Record cloudfront_url in education_videos table
    //   4. Push notification to user via SNS

    return {
      statusCode: 202,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ data: { video: null, fromCache: false } }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Video trigger failed' }),
    };
  }
};
