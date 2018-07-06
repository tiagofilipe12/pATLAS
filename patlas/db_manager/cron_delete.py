import sched
import datetime
import time
import threading

try:
    from db_app import db
    from db_app.models import UrlDatabase, FastaDownload
except ImportError:
    from patlas.db_manager.db_app import db
    from patlas.db_manager.db_app.models import UrlDatabase, FastaDownload


def delete_entries():
    """The function that actually deletes the entries in the database longer
    than 1 day.

    """

    # gets the difference between now and a day ago
    start_time = datetime.datetime.utcnow() - datetime.timedelta(days=1)
    # query the database
    db.session.query(UrlDatabase)\
        .filter(UrlDatabase.timestamp <= start_time) \
        .delete()

    db.session.commit()
    db.session.close()

    # for download sequence database delete everything after 15 minutes,
    # because it is only necessary when the user cancels the download
    start_time = datetime.datetime.utcnow() - datetime.timedelta(minutes=15)

    db.session.query(FastaDownload) \
        .filter(FastaDownload.timestamp <= start_time) \
        .delete()

    db.session.commit()
    db.session.close()


def delete_schedule(scheduler, interval, action, actionargs=()):
    """The function that enables the cycler to repeat itself and execute the
    `delete_entries` function.

    Parameters
    ----------
    scheduler: function
        the scheduler method defined in `super_delete`
    interval: float
        The interval in seconds between the executions of the `delete_schedule`
        function.
    action: function
        The function that will allow to actually delete the entries in the
        database
    actionargs: tuple
        The "recursive" part of the function, that enables the function to
        repeat in each cycle defined by the interval.

    """

    scheduler.enter(interval, 1, delete_schedule,
                    (scheduler, interval, action, actionargs))

    action(*actionargs)
    scheduler.run()


def super_delete(cycle):
    """Function that initializes the scheduler
    This function initializes a scheduler that executes a given function (in
    this case the function `delete_entries`), in every x seconds (given by the
    cycle variable).

    Parameters
    ----------
    cycle: float
        The interval in seconds between the executions of the `delete_schedule`
        function.


    """
    # starts the scheduler
    scheduler = sched.scheduler(time.time, time.sleep)

    # thread is used to avoid freezing the app, otherwise the app would be
    # frozen
    thread = threading.Thread(target=delete_schedule,
                              # 86400 corresponds to one day
                              args=(scheduler, cycle, delete_entries))
    thread.daemon = True
    thread.start()
