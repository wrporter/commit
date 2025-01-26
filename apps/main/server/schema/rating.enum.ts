
export enum Rating {
    Unacceptable = 1,
    NeedsImprovement = 2,
    MeetsExpectations = 3,
    ExceedsExpectations = 4,
    Outstanding = 5,
}

export const RATING_ADJUSTMENTS = {
    [Rating.Unacceptable]: 0.2,
    [Rating.NeedsImprovement]: 0.5,
    [Rating.MeetsExpectations]: 1,
    [Rating.ExceedsExpectations]: 1.5,
    [Rating.Outstanding]: 2,
}
