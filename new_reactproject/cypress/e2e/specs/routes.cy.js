describe('Quiz App Routes',()=>{
    const coreRoutes=[
   "/",
"/about",
"/contact",
"/register",
"/student",
"/bulk",
"/login",
"/course",
"/exam",
"/profile",
"/student_exam_login",
"/personalized_exam_interface",
"/dynamic_exam_interface",
"/student/exam/:examId",
"/admin_panel",
"/manage",
"/welcome",
"/quiz_demo",
"/image_upload",
"/create_question",
"/calculator",
"/exam/:examId",
"/exam/:examId/edit",
"/courses/:courseId",
"/courses/:courseId/edit",
"/student/:studentId",
"/student/:studentId/edit",
"/reports",

    ];

    beforeEach(()=>{
        //Auth token or mock data needed here
        cy.window().then((win)=>{
            //Clear existing state
            win.localStorage.clear();
        })
    })

    coreRoutes.forEach((route=>{
        it( ` should load ${route} without crashing `,()=>{
            cy.visit(route,{ failOnStatusCode:false});

            //Check for proper boundaries or crash indicators
            cy.get('body').should('exist');
            cy.get('[data-testid="error-boundary"]').should('not.exist');

            //Log route status
            cy.url().then(url =>{
                if(url.includes('404') || url.includes('error')){
                    cy.log(`❌ Route ${route} may be broken`);

                }else{
                    cy.log(`✅ Route ${route} loads successfully`)
                }
            })
        })
    }))
})