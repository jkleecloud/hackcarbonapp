from django.urls import path

from footprints import views


urlpatterns = [
    path("", views.dashboard, name="dashboard"),
    path("api/activities/", views.activities_api, name="activities-api"),
    path("tests/", views.calculation_tests, name="calculation-tests"),
]
