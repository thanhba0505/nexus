import { useCallback, useState } from 'react';
import { slackbotApi } from '../services/slackbot-api';
import type { SlackCredentialsDto, SlackStatusDto } from '../types';

export function useSlackStatus() {
  const [status, setStatus] = useState<SlackStatusDto | null>(null);
  const [credentials, setCredentials] = useState<SlackCredentialsDto | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshStatus = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [s, c] = await Promise.all([
        slackbotApi.checkSlackStatus(),
        slackbotApi.getSlackCredentials(),
      ]);
      setStatus(s);
      setCredentials(c);
      return { status: s, credentials: c };
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setError(message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    status,
    credentials,
    isLoading,
    error,
    refreshStatus,
  };
}
