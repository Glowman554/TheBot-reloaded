// deno-lint-ignore-file require-await no-empty
import { SimpleUntisClient } from "../../api/untis.ts";
import { config } from "../../config/config.ts";
import { loadable } from "../../loadable.ts";
import { help_text } from "../../utils/help.ts";
import { Command, command_manager, CommandEvent, CommandExecutor, CommandResponse, fail } from "../command.ts";

export default class Version implements loadable {
	load(): void {
		command_manager.add_command(
			new Command("untis", "Get untis informations!", help_text("Use '<prefix>untis' to get untis informations like homeworks / exams!"), {
				execute: async (event: CommandEvent): Promise<CommandResponse> => {
					if (event.interface.args.length != 0) {
						return fail;
					}

                    const untis = new SimpleUntisClient();
                    await untis.login(config.get("school", "untis"), config.get("user", "untis"), config.get("pass", "untis"));

                    var homework_string = "";
                    var hm = await untis.homeworks(new Date(), new Date(new Date().setDate(new Date().getDate() + 7)));
                    for (let x of hm.homeworks) {
                        var subject = hm.lessons.find((lesson) => lesson.id == x.lessonId)?.subject || "no";
                        var due_date = untis.convertUntisDate("" + x.dueDate).toLocaleDateString();

                        homework_string += `<bold>${subject}<bold>: ${x.text} muss bis zum <code>${due_date}<code> erledigt sein!\n`;
                    }

                    if (homework_string == "") {
                        homework_string = "Keine Aufgaben fuer heute!";
                    }

                    var class_services_string = "";
                    var cs = await untis.classservices(new Date(), new Date(new Date().setDate(new Date().getDate() + 7)));

                    for (let x of cs.classRoles) {
                        var due_date = untis.convertUntisDate("" + x.endDate).toLocaleDateString();
                        class_services_string += `<bold>${x.duty.label}<bold>: ${x.foreName} ${x.longName} bis zum <code>${due_date}<code>\n`;
                    }

                    var exams_string = "Klassenarbeiten:\n";
                    var ex = await untis.exams(new Date(), new Date(new Date().setDate(new Date().getDate() + 7)));

                    for (let x of ex.exams) {
                        var date = untis.convertUntisDate("" + x.examDate).toLocaleDateString();
                        exams_string += `<bold>${x.name}<bold>: ${x.text} am <bold>${date}<bold> in <code>${x.rooms.join(", ")}<code>\n`;
                    }

                    await untis.logout();


                    return {
						is_response: true,
						response: homework_string + "\n\n" + class_services_string + "\n\n" + exams_string
					};
				},
			} as CommandExecutor, "untis"),
		);
	}
}
