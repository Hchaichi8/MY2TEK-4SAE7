#ifndef DISTANCE_H
#define DISTANCE_H

#include <QDialog>

namespace Ui {
class distance;
}

class distance : public QDialog
{
    Q_OBJECT

public:
    explicit distance(QWidget *parent = nullptr);
    ~distance();

private:
    Ui::distance *ui;
};

#endif // DISTANCE_H
