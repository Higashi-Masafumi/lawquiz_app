
export class Question {
    constructor(
      public readonly theme: string,
      public readonly question: string,
      public readonly answer: string,
      public readonly comment: string
    ) {}
  
    static fromResponse(response: any): Question {
      return new Question(
        response.theme,
        response.question,
        response.answer,
        response.comment
      );
    }
  }