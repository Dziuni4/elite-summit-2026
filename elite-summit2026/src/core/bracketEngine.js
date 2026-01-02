import { Stage, MatchStatus } from "./models.js";
import { ValidationError } from "./errors.js";

export class BracketEngine {
    /**
     * Uzupełnia FINAL i THIRD na podstawie wyników SF1 i SF2.
     * Działa nawet gdy część danych jest TBA (null).
     *
     * Zasada:
     * - FINAL: winner(SF1) vs winner(SF2)
     * - THIRD: loser(SF1) vs loser(SF2)
     */
    static propagate(tournament) {
        const sf1 = tournament.getMatchByStage(Stage.SF1);
        const sf2 = tournament.getMatchByStage(Stage.SF2);
        const final = tournament.getMatchByStage(Stage.FINAL);
        const third = tournament.getMatchByStage(Stage.THIRD);

        if (!sf1 || !sf2 || !final || !third) {
            throw new ValidationError("Missing required stages (sf1, sf2, final, third)");
        }

        const w1 = sf1.getWinnerId();
        const w2 = sf2.getWinnerId();
        const l1 = sf1.getLoserId();
        const l2 = sf2.getLoserId();

        // FINAL teams
        final.teamA = w1 ?? null;
        final.teamB = w2 ?? null;

        // THIRD place teams
        third.teamA = l1 ?? null;
        third.teamB = l2 ?? null;

        // Gdy final/third mają status finished, to nie ruszamy statusu.
        // Gdy wypełniliśmy oba teamy i nie jest finished, możemy ustawić upcoming.
        if (final.status !== MatchStatus.FINISHED) {
            final.status = (final.teamA && final.teamB) ? MatchStatus.UPCOMING : MatchStatus.UPCOMING;
        }
        if (third.status !== MatchStatus.FINISHED) {
            third.status = (third.teamA && third.teamB) ? MatchStatus.UPCOMING : MatchStatus.UPCOMING;
        }

        return tournament;
    }

    /**
     * Wylicza statusy drużyn na podstawie drabinki:
     * - winner final => "zwycięzca" (place 1)
     * - loser final => place 2
     * - winner third => place 3
     * - loser third => place 4
     * - przegrani półfinałów (jeśli third jeszcze nie finished) => "odpadli" ale bez miejsca
     */
    static computeTeamOutcomes(tournament) {
        const outcomes = new Map(); // teamId -> { status, place }

        const final = tournament.getMatchByStage(Stage.FINAL);
        const third = tournament.getMatchByStage(Stage.THIRD);

        // Final placements
        if (final) {
            const wf = final.getWinnerId();
            const lf = final.getLoserId();
            if (wf) outcomes.set(wf, { status: "zwycięzca", place: 1 });
            if (lf) outcomes.set(lf, { status: "finalista", place: 2 });
        }

        // Third place placements
        if (third) {
            const wt = third.getWinnerId();
            const lt = third.getLoserId();
            if (wt) outcomes.set(wt, { status: "3. miejsce", place: 3 });
            if (lt) outcomes.set(lt, { status: "4. miejsce", place: 4 });
        }

        // Semi losers when known (but no place yet if third not finished)
        const sf1 = tournament.getMatchByStage(Stage.SF1);
        const sf2 = tournament.getMatchByStage(Stage.SF2);
        for (const sf of [sf1, sf2]) {
            if (!sf) continue;
            const loser = sf.getLoserId();
            if (loser && !outcomes.has(loser)) {
                outcomes.set(loser, { status: "odpadli", place: null });
            }
            const winner = sf.getWinnerId();
            if (winner && !outcomes.has(winner)) {
                outcomes.set(winner, { status: "w grze", place: null });
            }
        }

        // Fill remaining teams
        for (const t of tournament.teams) {
            if (!outcomes.has(t.id)) outcomes.set(t.id, { status: "w grze", place: null });
        }

        return outcomes;
    }
}
