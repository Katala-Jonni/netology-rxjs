import { fromEvent } from 'rxjs';
import { ajax } from "rxjs/ajax";
import {
    bufferCount,
    concatAll,
    debounceTime,
    distinctUntilChanged, filter,
    map,
    pluck, reduce,
    switchMap, tap
} from "rxjs/operators";

const input = document.querySelector('input') as HTMLInputElement;
const result = document.querySelector('.result') as HTMLDivElement;
const spinner = document.querySelector('.spinner') as HTMLDivElement;

const createCard = ({ name: project_name, web_url, namespace: { name } }): string => {
    return `
        <div class="col-md-4">
            <div class="card" style="width: 18rem;">
                <div class="card-body">
                    <p class="card-text">${project_name}</p>
                    <p><small>Author: ${name}</small></p>
                    <a href="${web_url}" class="btn btn-primary"
                       target="_blank">Open Repository</a>
                </div>
            </div>
        </div>
    `;
};

const createRow = (arr: string[]): string => {
    return `
    <div class="row">${arr.join(' ')}</div>
    `;
};

const request = (v: string) => {
    return ajax(`https://gitlab.com/api/v4/projects?search=${v}`)
        .pipe(
            pluck('response'),
            concatAll(),
            map(createCard),
            bufferCount(3),
            reduce((start: string, acc: string[]): any[string] => {
                start += createRow(acc);
                return start;
            }, ''),
            map((str: string) => {
                return str.trim().replace('/\s+(<)/g', '<')
            })
        )
};

const liveSearch = fromEvent<Event>(input, 'input')
    .pipe(
        debounceTime(300),
        pluck('target', 'value'),
        filter((v: string) => v.length > 3),
        map((v: string) => v.trim()),
        distinctUntilChanged(),
        tap(() => {
            result.innerHTML = '';
            spinner.classList.remove('visually-hidden');
        }),
        switchMap(request),
        tap(() => {
            spinner.classList.add('visually-hidden');
        }),
    );

liveSearch.subscribe({
    next: (value: any) => {
        result.innerHTML = value ? value : 'No Results';
    },
    complete: () => console.log('Complete!'),
    error: (error) => console.log('Error!', error)
});
