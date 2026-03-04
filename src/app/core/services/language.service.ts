import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface Language {
  code: string;
  name: string;
  nativeName: string;
}

@Injectable({
  providedIn: 'root'
})
export class LanguageService {
  private readonly STORAGE_KEY = 'selectedLanguage';
  private readonly DEFAULT_LANGUAGE = 'en';

  private currentLanguageSubject: BehaviorSubject<string>;
  public currentLanguage$: Observable<string>;

  public readonly availableLanguages: Language[] = [
    { code: 'en', name: 'English', nativeName: 'English' },
    { code: 'mr', name: 'Marathi', nativeName: 'मराठी' }
  ];

  constructor(private translate: TranslateService) {
    const savedLanguage = this.getSavedLanguage();
    this.currentLanguageSubject = new BehaviorSubject<string>(savedLanguage);
    this.currentLanguage$ = this.currentLanguageSubject.asObservable();

    this.initializeLanguage();
  }

  private initializeLanguage(): void {
    // Set available languages
    const languageCodes = this.availableLanguages.map(lang => lang.code);
    this.translate.addLangs(languageCodes);

    // Set default language
    this.translate.setDefaultLang(this.DEFAULT_LANGUAGE);

    // Use saved language or default
    const currentLang = this.currentLanguageSubject.value;
    this.translate.use(currentLang);
  }

  public setLanguage(languageCode: string): void {
    if (this.isLanguageAvailable(languageCode)) {
      this.translate.use(languageCode);
      this.saveLanguage(languageCode);
      this.currentLanguageSubject.next(languageCode);
    }
  }

  public getCurrentLanguage(): string {
    return this.currentLanguageSubject.value;
  }

  public getCurrentLanguageObject(): Language | undefined {
    return this.availableLanguages.find(
      lang => lang.code === this.getCurrentLanguage()
    );
  }

  private isLanguageAvailable(languageCode: string): boolean {
    return this.availableLanguages.some(lang => lang.code === languageCode);
  }

  private saveLanguage(languageCode: string): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, languageCode);
    } catch (error) {
      console.error('Error saving language preference:', error);
    }
  }

  private getSavedLanguage(): string {
    try {
      const saved = localStorage.getItem(this.STORAGE_KEY);
      return saved && this.isLanguageAvailable(saved) ? saved : this.DEFAULT_LANGUAGE;
    } catch (error) {
      console.error('Error reading language preference:', error);
      return this.DEFAULT_LANGUAGE;
    }
  }
}
