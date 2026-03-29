#ifndef CONSTAT_H
#define CONSTAT_H

#include <QDialog>

namespace Ui {
class constat;
}

class constat : public QDialog
{
    Q_OBJECT

public:
    explicit constat(QWidget *parent = nullptr);
    ~constat();

private:
    Ui::constat *ui;
};

#endif // CONSTAT_H
