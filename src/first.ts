import { fromEvent } from 'rxjs';
import { ajax } from "rxjs/ajax";
import {
    debounceTime,
    distinctUntilChanged, filter,
    map,
    pluck,
    switchMap
} from "rxjs/operators";

const input = document.querySelector('input') as HTMLInputElement;

const request = (v: string) => {
    return ajax(`https://api.github.com/search/repositories?q=${v}`)
        .pipe(
            pluck('response', 'items')
        )
};

const liveSearch = fromEvent<Event>(input, 'input')
    .pipe(
        debounceTime(300),
        pluck('target', 'value'),
        filter((v: string) => v.length > 3),
        map((v: string) => v.trim()),
        distinctUntilChanged(),
        switchMap(request)
    );

liveSearch.subscribe({
    next: (value: any) => console.log('Next:', value),
    complete: () => console.log('Complete!'),
    error: (error) => console.log('Error!', error)
});
