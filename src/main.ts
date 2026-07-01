import * as core from '@actions/core'
import { Context } from '@actions/github/lib/context'
import { DeploymentStatus, getInput, getEnvironment, postSlackNotification } from './utils'

export async function run (): Promise<void> {
  let jobStatus: string
  let environment: string
  let slackToken: string
  let slackChannel: string
  let deploymentConfidenceUrl: string
  let currentSha: string

  const context = new Context()
  const { actor, ref, repo, sha } = context

  console.log('### post.context ###')
  console.log(`actor: ${actor}`)
  console.log(`ref: ${ref}`)
  console.log(`owner: ${repo.owner}`)
  console.log(`repo: ${repo.repo}`)
  console.log(`compare: ${context.payload.compare as string}`)
  console.log(`new_sha: ${sha}`)
  console.log('\n')

  console.log('### post.inputs ###')

  try {
    jobStatus = getInput('job_status') ?? 'success'
    console.log(`job_status: ${jobStatus}`)

    environment = getEnvironment(ref)

    slackToken = getInput('slack_token') ?? ''
    console.log(`slack_token: ${slackToken === '' ? 'none' : 'passed'}`)

    slackChannel = getInput('slack_channel') ?? ''
    console.log(`slack_channel: ${slackChannel}`)

    currentSha = getInput('current_sha') ?? sha
    console.log(`current_sha: ${currentSha}`)

    deploymentConfidenceUrl = getInput('deployment_confidence_url') ?? ''
    console.log(`deployment confidence dashboard URL: ${deploymentConfidenceUrl}`)
  } catch (error) {
    core.error(error as Error)
    core.setFailed(`Wrong parameters given: ${JSON.stringify(error, null, 2)}`)
    throw error
  }
  console.log('\n')
  console.log('### post ###')

  const status: DeploymentStatus = jobStatus === 'success' ? 'success' : 'failure'
  console.log(`status: ${status}`)

  // Post Slack notification
  await postSlackNotification(slackToken, slackChannel, environment, status, context, deploymentConfidenceUrl, currentSha)
}

if (process.env.NODE_ENV !== 'test') run() // eslint-disable-line @typescript-eslint/no-floating-promises
