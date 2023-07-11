import { Overrides } from '../config';
import {
  CreateEventQueryParams,
  CreateEventRequest,
  DestroyEventQueryParams,
  Event,
  FindEventQueryParams,
  ListEventQueryParams,
  UpdateEventQueryParams,
  UpdateEventRequest,
} from '../models/events';
import {
  NylasDeleteResponse,
  NylasResponse,
  NylasListResponse,
} from '../models/response';
import { AsyncListResponse, Resource } from './resource';

interface FindEventParams {
  eventId: string;
  queryParams: FindEventQueryParams;
  identifier: string;
}
interface ListEventParams {
  identifier: string;
  queryParams: ListEventQueryParams;
}

interface CreateEventParams {
  identifier: string;
  queryParams: CreateEventQueryParams;
  requestBody: CreateEventRequest;
}

interface UpdateEventParams {
  eventId: string;
  identifier: string;
  queryParams: UpdateEventQueryParams;
  requestBody: UpdateEventRequest;
}

interface DestroyEventParams {
  identifier: string;
  eventId: string;
  queryParams: DestroyEventQueryParams;
}
export class Events extends Resource {
  public list({
    identifier,
    queryParams,
    overrides,
  }: ListEventParams & Overrides): AsyncListResponse<NylasListResponse<Event>> {
    return super._list({
      queryParams,
      path: `/v3/grants/${identifier}/events`,
      overrides,
    });
  }

  public find({
    identifier,
    eventId,
    queryParams,
    overrides,
  }: FindEventParams & Overrides): Promise<NylasResponse<Event>> {
    return super._find({
      path: `/v3/grants/${identifier}/events/${eventId}`,
      queryParams,
      overrides,
    });
  }

  public create({
    identifier,
    requestBody,
    queryParams,
    overrides,
  }: CreateEventParams & Overrides): Promise<NylasResponse<Event>> {
    return super._create({
      path: `/v3/grants/${identifier}/events`,
      queryParams,
      requestBody,
      overrides,
    });
  }

  public update({
    identifier,
    eventId,
    requestBody,
    queryParams,
    overrides,
  }: UpdateEventParams & Overrides): Promise<NylasResponse<Event>> {
    return super._update({
      path: `/v3/grants/${identifier}/events/${eventId}`,
      queryParams,
      requestBody,
      overrides,
    });
  }

  public destroy({
    identifier,
    eventId,
    queryParams,
    overrides,
  }: DestroyEventParams & Overrides): Promise<NylasDeleteResponse> {
    return super._destroy({
      path: `/v3/grants/${identifier}/events/${eventId}`,
      queryParams,
      overrides,
    });
  }
}