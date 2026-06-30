import * as core from '@actions/core'
import * as main from '../src/main'

import nock from "nock";

const postStatusReply = {} as any

describe('complete', () => {
  const originalEnv = { ...process.env }

  beforeEach(() => {
    process.env["STATE_deployment_id"] = "42";

    let inputs = {} as any;
    let inputSpy: jest.SpyInstance;

    // @actions/core
    inputs = {
      token: "fake-token",
      type: "create",
      slack_token: "fake-slack-token",
      slack_channel: "fake-slack-channel",
    };
    inputSpy = jest.spyOn(core, "getInput");
    inputSpy.mockImplementation((name) => inputs[name]);

    // @actions/github Context is hydrated from these environment variables
    process.env.GITHUB_ACTOR = 'Fake-Actor'
    process.env.GITHUB_REF = 'refs/heads/master'
    process.env.GITHUB_SHA = 'fake-sha-123'
    process.env.GITHUB_REPOSITORY = 'owner/repo'
  });

  afterEach(() => {
    for (const key of Object.keys(process.env)) {
      if (!(key in originalEnv)) {
        delete process.env[key]
      }
    }
    Object.assign(process.env, originalEnv)

    jest.resetAllMocks();
    jest.clearAllMocks();
  });

  it("200", async () => {
    // arrange
    const slack = nock('https://slack.com')
        .post('/api/chat.postMessage', body => body.text.includes('<@fake-actor>'))
        .reply(200, { ok: true })

    // act
    await main.run()

    // assert
    slack.done()
  })
})
