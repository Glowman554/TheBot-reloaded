import { log } from "../logger.ts";

export interface Homeworks {
	records: HomeworkRecord[];
	homeworks: Homework[];
	teachers: Teacher[];
	lessons: Lesson[];
}

export interface HomeworkRecord {
	homeworkId: number;
	teacherId: number;
	elementIds: number[];
}

export interface Homework {
	id: number;
	lessonId: number;
	date: number;
	dueDate: number;
	text: string;
	remark: string;
	completed: boolean;
	attachments: any[];
}

export interface Teacher {
	id: number;
	name: string;
}

export interface Lesson {
	id: number;
	subject: string;
	lessonType: string;
}

export interface Exams {
	exams: Exam[];
}

export interface Exam {
	id: number;
	examType: string;
	name: string;
	studentClass: string[];
	assignedStudents: AssignedStudent[];
	examDate: number;
	startTime: number;
	endTime: number;
	subject: string;
	teachers: string[];
	rooms: string[];
	text: string;
	grade: string;
}

export interface AssignedStudent {
	klasse: Klasse;
	gradeProtection: boolean;
	disadvantageCompensation: boolean;
	displayName: string;
	id: number;
}

export interface Klasse {
	id: number;
	name: string;
}

export interface ClassServices {
	classRoles: ClassRole[];
}

export interface ClassRole {
	id: number;
	personId: number;
	klasse: Klasse;
	foreName: string;
	longName: string;
	duty: Duty;
	startDate: number;
	endDate: number;
	text: string;
}

export interface Duty {
	id: number;
	label: string;
}

export class SimpleUntisClient {
	private cookie: string | undefined;

	async login(school: string, user: string, pass: string) {
		const req = await fetch("https://neilo.webuntis.com/WebUntis/j_spring_security_check", {
			method: "POST",
			body: `school=${encodeURIComponent(school)}&j_username=${encodeURIComponent(user)}&j_password=${encodeURIComponent(pass)}&token=`,
			headers: {
				"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/111.0.0.0 Safari/537.36 Edg/111.0.1661.41",
				"Accept": "application/json",
				"Content-Type": "application/x-www-form-urlencoded",
			},
		});

		const json = await req.text();
		log("untis", json);

		let cookie = req.headers.get("set-cookie");
		if (cookie) {
			this.cookie = cookie;
		} else {
			throw new Error("Login failed!");
		}
	}

	async logout() {
		if (!this.cookie) {
			throw new Error("Login first!");
		}

		await fetch("https://neilo.webuntis.com/WebUntis/saml/logout", {
			headers: {
				"Cookie": this.cookie,
			},
		});
	}

	convertDateToUntis(date: Date): string {
		return (date.getFullYear().toString() + (date.getMonth() + 1 < 10 ? "0" + (date.getMonth() + 1) : date.getMonth() + 1).toString() + (date.getDate() < 10 ? "0" + date.getDate() : date.getDate()).toString());
	}

	convertUntisDate(date: string): Date {
		const ret = new Date();
		ret.setHours(0, 0, 0, 0);

		ret.setFullYear(parseInt(date.slice(0, 4)), parseInt(date.slice(4, 6)) - 1, parseInt(date.slice(6, 8)));

		return ret;
	}

	async homeworks(start: Date, end: Date) {
		if (!this.cookie) {
			throw new Error("Login first!");
		}

		const req = await fetch(`https://neilo.webuntis.com/WebUntis/api/homeworks/lessons?startDate=${this.convertDateToUntis(start)}&endDate=${this.convertDateToUntis(end)}`, {
			headers: {
				"Cookie": this.cookie,
				"Accept": "application/json",
			},
		});

		return (await req.json()).data as Homeworks;
	}

	async exams(start: Date, end: Date) {
		if (!this.cookie) {
			throw new Error("Login first!");
		}

		const req = await fetch(`https://neilo.webuntis.com/WebUntis/api/exams?startDate=${this.convertDateToUntis(start)}&endDate=${this.convertDateToUntis(end)}`, {
			headers: {
				"Cookie": this.cookie,
				"Accept": "application/json",
			},
		});

		return (await req.json()).data as Exams;
	}

	async classservices(start: Date, end: Date) {
		if (!this.cookie) {
			throw new Error("Login first!");
		}

		const req = await fetch(`https://neilo.webuntis.com/WebUntis/api/classreg/classservices?startDate=${this.convertDateToUntis(start)}&endDate=${this.convertDateToUntis(end)}`, {
			headers: {
				"Cookie": this.cookie,
				"Accept": "application/json",
			},
		});

		return (await req.json()).data as ClassServices;
	}
}