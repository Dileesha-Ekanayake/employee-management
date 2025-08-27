import type {Gender} from "./Gender.ts";

export interface Employee {
    id?: number;
    name: string;
    nic: string;
    email: string;
    gender: Gender;
}
