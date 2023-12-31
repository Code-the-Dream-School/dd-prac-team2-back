import { WebClient } from '@slack/web-api';
import { Blocks, HomeTab, Md } from 'slack-block-builder';
import {
  getGenericGreetingView,
  getGreetingsView,
} from '../../views/home/greetings';
import { buildUserRoleSection } from '../../views/home/userRole';
import { buildCohortSection } from '../../views/home/cohort';
import { buildSession, buildPastSession } from '../../views/home/session';
import { getLoadingView, getErrorView } from '../../views';
import sessionsService from '../../services/sessions';
import { SlackMember } from '../../types/member';
import { extractMemberProfile } from '../../utils/memberHelper';
import { determineUserRole } from '../../utils/userRoleHelper';
import { isSessionPast } from '../../utils/sessionTimeUtils';
import { CohortSession } from '../../types/cohortSession';

export const handleHomeOpened = async (client: WebClient, userId: string) => {
  await client.views.publish({
    user_id: userId,
    view: getLoadingView(),
  });

  // TODO: combine both calls since I need member tz for time conversion
  let member: SlackMember;
  let greetingView = getGenericGreetingView();

  try {
    const slackUserInfo = await client.users.info({ user: userId });
    if (slackUserInfo.ok) {
      member = extractMemberProfile(slackUserInfo);
      greetingView = getGreetingsView(member);
    }
  } catch (error) {
    console.error(
      `Failed to fetch user info due to ${(error as Error).message}`
    );
  }

  let sessionView: any[] = [];

  try {
    const sessions = await sessionsService.getThisWeekSessions(userId);
    const userRole = determineUserRole(sessions.user);
    const userRoleView = buildUserRoleSection(userRole, sessions.cohorts);
    sessionView.push(...userRoleView);

    // cohort section
    sessions.cohorts.forEach((cohort) => {
      const cohortSection = buildCohortSection(cohort);
      sessionView.push(...cohortSection);
      if (cohort.sessions.length === 0) {
        sessionView.push(
          Blocks.Section().text('No sessions scheduled for this week.')
        );
      } else {
        let upcomingSessions: CohortSession[] = [];
        let pastSessions: CohortSession[] = [];

        cohort.sessions.forEach((session) => {
          if (isSessionPast(session, member)) {
            pastSessions.push(session);
          } else {
            upcomingSessions.push(session);
          }
        });
        if (upcomingSessions.length === 0) {
          sessionView.push(Blocks.Section().text(Md.bold('Upcoming Sessions')));
          sessionView.push(
            Blocks.Section().text('... no sessions available ...')
          );
          sessionView.push(Blocks.Divider());
        } else {
          sessionView.push(
            Blocks.Section().text(Md.bold(' Upcoming Sessions'))
          );
          upcomingSessions.forEach((session) => {
            const sessionBlock = buildSession(member, userRole, session);
            sessionView.push(...sessionBlock);
          });
        }

        if (pastSessions.length > 0) {
          sessionView.push(Blocks.Section().text(Md.bold('Past Sessions')));
          pastSessions.forEach((session) => {
            const sessionBlock = buildPastSession(member, userRole, session);
            sessionView.push(...sessionBlock);
          });
        }
      }
    });
  } catch (error) {
    console.error(
      `Failed to fetch sessions due to ${(error as Error).message}`
    );
    sessionView = [getErrorView()];
  }

  const homeTab = HomeTab()
    .blocks([...greetingView, ...sessionView])
    .buildToObject();

  await client.views.publish({
    user_id: userId,
    view: homeTab,
  });
};
