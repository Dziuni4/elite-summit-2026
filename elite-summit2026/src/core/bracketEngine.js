import { Stage, MatchStatus } from "./models.js";
import { ValidationError } from "./errors.js";

export class BracketEngine {
    static propagate(tournament) {
        const qf1 = tournament.getMatchByStage(Stage.QF1);
        const qf2 = tournament.getMatchByStage(Stage.QF2);
        const qf3 = tournament.getMatchByStage(Stage.QF3);
        const qf4 = tournament.getMatchByStage(Stage.QF4);

        const sf1 = tournament.getMatchByStage(Stage.SF1);
        const sf2 = tournament.getMatchByStage(Stage.SF2);
        const final = tournament.getMatchByStage(Stage.FINAL);
        const third = tournament.getMatchByStage(Stage.THIRD);

        if (![qf1,qf2,qf3,qf4,sf1,sf2,final,third].every(Boolean)) {
            throw new ValidationError("Missing required stages for 8-team bracket");
        }

        // QF → SF
        sf1.teamA = qf1.getWinnerId();
        sf1.teamB = qf2.getWinnerId();

        sf2.teamA = qf3.getWinnerId();
        sf2.teamB = qf4.getWinnerId();

        // SF → FINAL / THIRD
        final.teamA = sf1.getWinnerId();
        final.teamB = sf2.getWinnerId();

        third.teamA = sf1.getLoserId();
        third.teamB = sf2.getLoserId();

        return tournament;
    }

    static computeTeamOutcomes(tournament) {
        const outcomes = new Map();

        const final = tournament.getMatchByStage(Stage.FINAL);
        const third = tournament.getMatchByStage(Stage.THIRD);

        if (final?.getWinnerId()) {
            outcomes.set(final.getWinnerId(), { status: "zwycięzca", place: 1 });
            outcomes.set(final.getLoserId(), { status: "finalista", place: 2 });
        }

        if (third?.getWinnerId()) {
            outcomes.set(third.getWinnerId(), { status: "3. miejsce", place: 3 });
            outcomes.set(third.getLoserId(), { status: "4. miejsce", place: 4 });
        }

        // reszta
        for (const t of tournament.teams) {
            if (!outcomes.has(t.id)) {
                outcomes.set(t.id, { status: "odpadli", place: null });
            }
        }

        return outcomes;
    }
}
