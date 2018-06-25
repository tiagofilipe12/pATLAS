import sched
import datetime, time
import threading

try:
    from db_app import db
    from db_app.models import UrlDatabase
except ImportError:
    from patlas.db_manager.db_app import db
    from patlas.db_manager.db_app.models import UrlDatabase



def delete_entries():
    start_time = datetime.datetime.utcnow() - datetime.timedelta(days=1)
    print("lolo", start_time)
    db.session.query(UrlDatabase)\
        .filter(UrlDatabase.timestamp <= start_time) \
        .delete()
        # .all()

    db.session.commit()
    db.session.close()

def delete_schedule(scheduler, interval, action, actionargs=()):
    print("start", time.time())
    scheduler.enter(interval, 1, delete_schedule, (scheduler, interval, action, actionargs))

    print("lilalsal")
    action(*actionargs)
    scheduler.run()


def super_delete():
    scheduler = sched.scheduler(time.time, time.sleep)

    # delete_schedule(scheduler, 86400, delete_entries)
    thread = threading.Thread(target=delete_schedule,
                              args=(scheduler, 86400, delete_entries))
    thread.daemon = True
    thread.start()

